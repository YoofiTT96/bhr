package com.turntabl.bonarda.security.oauth2;

import com.turntabl.bonarda.config.AzureAdProperties;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.EmployeeStatus;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.security.UserPrincipal;
import com.turntabl.bonarda.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@ConditionalOnProperty(name = "azure.ad.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final EmployeeRepository employeeRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AzureAdProperties azureAdProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            email = oAuth2User.getAttribute("preferred_username");
        }

        if (email == null) {
            log.error("Azure AD login: no email found in OAuth2 user attributes: {}",
                    oAuth2User.getAttributes().keySet());
            redirectWithError(response, "no_email",
                    "Could not determine email from Microsoft account");
            return;
        }

        Employee employee = employeeRepository.findByEmail(email).orElse(null);

        if (employee == null) {
            log.warn("Azure AD login: no employee found for email: {}", email);
            redirectWithError(response, "employee_not_found",
                    "No employee account found for " + email);
            return;
        }

        if (employee.getStatus() == EmployeeStatus.TERMINATED
                || employee.getStatus() == EmployeeStatus.INACTIVE) {
            log.warn("Azure AD login: employee {} is {}", email, employee.getStatus());
            redirectWithError(response, "account_disabled",
                    "Your account is disabled. Please contact HR.");
            return;
        }

        // Update microsoftUserId if not already set
        String microsoftUserId = oAuth2User.getAttribute("sub");
        if (microsoftUserId != null && employee.getMicrosoftUserId() == null) {
            employee.setMicrosoftUserId(microsoftUserId);
            employeeRepository.save(employee);
        }

        UserPrincipal principal = UserPrincipal.from(employee);
        String token = jwtTokenProvider.generateToken(principal);

        // Invalidate the HTTP session created during OAuth2 flow
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Use URL fragment (#) instead of query params (?) for token delivery.
        // Fragments are never sent to servers or logged in server access logs.
        String redirectUrl = azureAdProperties.getFrontendCallbackUrl()
                + "#token=" + token;

        log.info("Azure AD login successful for: {}", email);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private void redirectWithError(HttpServletResponse response,
                                   String errorCode,
                                   String errorMessage) throws IOException {
        String encoded = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        String redirectUrl = azureAdProperties.getFrontendCallbackUrl()
                + "#error=" + errorCode + "&error_description=" + encoded;
        response.sendRedirect(redirectUrl);
    }
}
