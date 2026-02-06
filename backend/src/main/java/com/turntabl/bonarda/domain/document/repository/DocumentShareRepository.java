package com.turntabl.bonarda.domain.document.repository;

import com.turntabl.bonarda.domain.document.model.DocumentShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentShareRepository extends JpaRepository<DocumentShare, Long> {

    Optional<DocumentShare> findByPublicId(UUID publicId);

    @Query("SELECT ds FROM DocumentShare ds JOIN FETCH ds.document d JOIN FETCH d.uploadedBy WHERE ds.employee.id = :employeeId ORDER BY ds.createdAt DESC")
    List<DocumentShare> findByEmployeeIdWithDocument(@Param("employeeId") Long employeeId);

    @Query("SELECT ds FROM DocumentShare ds JOIN FETCH ds.employee JOIN FETCH ds.sharedBy WHERE ds.document.id = :documentId")
    List<DocumentShare> findByDocumentIdWithEmployee(@Param("documentId") Long documentId);

    Optional<DocumentShare> findByDocumentIdAndEmployeeId(Long documentId, Long employeeId);

    boolean existsByDocumentIdAndEmployeeId(Long documentId, Long employeeId);
}
