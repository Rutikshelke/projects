package com.DailyCodeBuffer.projectforjpa_Tutorial.Repository;

import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher,Long> {
}
