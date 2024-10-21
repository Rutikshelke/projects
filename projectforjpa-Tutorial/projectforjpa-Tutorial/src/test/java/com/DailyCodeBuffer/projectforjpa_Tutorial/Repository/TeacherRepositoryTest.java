package com.DailyCodeBuffer.projectforjpa_Tutorial.Repository;

import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Course;
import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Teacher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
@SpringBootTest
class TeacherRepositoryTest {
    @Autowired
    private TeacherRepository teacherRepository;
@Test
    public void saveTeacher() {
        Course course = Course.builder().title("DBA").credit(7).build();
        Teacher teacher = Teacher.builder().
    courses(List.of(course)).
    lastname("Prasad").firstname("Kulkarni").build();
    teacherRepository.save(teacher);
    }

}