package com.lumina.lms.repository;

import com.lumina.lms.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);
    List<Submission> findByStudentId(Long studentId);
    List<Submission> findByStudentIdAndStatus(Long studentId, String status);
    List<Submission> findByAssignmentCourseTeacherId(Long teacherId);
    java.util.Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Submission s JOIN s.assignment.course.enrolledStudents st WHERE st.id = :studentId AND s.status = :status")
    List<Submission> findGradedByStudentEnrolled(@org.springframework.data.repository.query.Param("studentId") Long studentId, @org.springframework.data.repository.query.Param("status") String status);
}
