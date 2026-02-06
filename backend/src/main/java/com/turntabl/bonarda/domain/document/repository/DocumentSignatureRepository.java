package com.turntabl.bonarda.domain.document.repository;

import com.turntabl.bonarda.domain.document.model.DocumentSignature;
import com.turntabl.bonarda.domain.document.model.SignatureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentSignatureRepository extends JpaRepository<DocumentSignature, Long> {

    Optional<DocumentSignature> findByPublicId(UUID publicId);

    @Query("SELECT ds FROM DocumentSignature ds JOIN FETCH ds.document d JOIN FETCH d.uploadedBy WHERE ds.employee.id = :employeeId AND ds.status = com.turntabl.bonarda.domain.document.model.SignatureStatus.PENDING ORDER BY ds.createdAt DESC")
    List<DocumentSignature> findPendingByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT ds FROM DocumentSignature ds JOIN FETCH ds.employee WHERE ds.document.id = :documentId")
    List<DocumentSignature> findByDocumentIdWithEmployee(@Param("documentId") Long documentId);

    @Query("SELECT ds FROM DocumentSignature ds JOIN FETCH ds.document d JOIN FETCH d.uploadedBy WHERE ds.employee.id = :employeeId ORDER BY ds.createdAt DESC")
    List<DocumentSignature> findAllByEmployeeId(@Param("employeeId") Long employeeId);

    boolean existsByDocumentIdAndEmployeeId(Long documentId, Long employeeId);

    Optional<DocumentSignature> findByDocumentIdAndEmployeeId(Long documentId, Long employeeId);

    long countByDocumentIdAndStatus(Long documentId, SignatureStatus status);
}
