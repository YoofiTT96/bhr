package com.turntabl.bonarda.domain.document.repository;

import com.turntabl.bonarda.domain.document.model.Document;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Optional<Document> findByPublicId(UUID publicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Document d JOIN FETCH d.uploadedBy WHERE d.publicId = :publicId")
    Optional<Document> findByPublicIdForUpdate(@Param("publicId") UUID publicId);

    @Query("SELECT d FROM Document d JOIN FETCH d.uploadedBy WHERE d.publicId = :publicId")
    Optional<Document> findByPublicIdWithUploader(@Param("publicId") UUID publicId);

    @Query(value = "SELECT d FROM Document d JOIN FETCH d.uploadedBy WHERE d.status <> com.turntabl.bonarda.domain.document.model.DocumentStatus.ARCHIVED",
           countQuery = "SELECT count(d) FROM Document d WHERE d.status <> com.turntabl.bonarda.domain.document.model.DocumentStatus.ARCHIVED")
    Page<Document> findAllActive(Pageable pageable);

    @Query("SELECT d FROM Document d JOIN FETCH d.uploadedBy WHERE d.uploadedBy.id = :employeeId ORDER BY d.createdAt DESC")
    List<Document> findByUploadedById(@Param("employeeId") Long employeeId);

    @Query(value = "SELECT d FROM Document d JOIN FETCH d.uploadedBy WHERE d.companyWide = true AND d.status <> com.turntabl.bonarda.domain.document.model.DocumentStatus.ARCHIVED",
           countQuery = "SELECT count(d) FROM Document d WHERE d.companyWide = true AND d.status <> com.turntabl.bonarda.domain.document.model.DocumentStatus.ARCHIVED")
    Page<Document> findCompanyWide(Pageable pageable);

    @Query("SELECT d FROM Document d JOIN FETCH d.uploadedBy WHERE d.uploadedBy.publicId = :uploaderPublicId AND d.status <> com.turntabl.bonarda.domain.document.model.DocumentStatus.ARCHIVED ORDER BY d.createdAt DESC")
    List<Document> findByUploaderPublicId(@Param("uploaderPublicId") UUID uploaderPublicId);
}
