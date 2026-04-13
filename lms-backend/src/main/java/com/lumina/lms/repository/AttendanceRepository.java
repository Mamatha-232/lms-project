package com.lumina.lms.repository;

import com.lumina.lms.model.Attendance;
import com.lumina.lms.model.Course;
import com.lumina.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByCourseIdAndDate(Long courseId, LocalDate date);
    List<Attendance> findByStudentIdAndCourseId(Long studentId, Long courseId);
    Optional<Attendance> findByCourseAndStudentAndDate(Course course, User student, LocalDate date);
}
