package com.DailyCodeBuffer.projectforjpa_Tutorial.Repository;

import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Course;
import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Student;
import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Teacher;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

@SpringBootTest
class CourseRepositoryTest {
    @Autowired
    private CourseRepository courseRepository;

    @Test
    public void printCourses() {
        List<Course> courses = courseRepository.findAll();
        System.out.println(courses);
    }

    @Test
    @Transactional
    public void saveTeacherWithCourse() {
        Teacher teacher = Teacher.builder().firstname("Jayshree").lastname("Wagulde").build();
        Course course = Course.builder().teacher(teacher).title("Python").credit(5).build();
        courseRepository.save(course);
    }

    @Test
    public void findAllPagination() {
        Pageable firstPageThreeRecords = PageRequest.of(0, 1);
        Pageable secondPageWithTwoRecords = PageRequest.of(1, 1);
        List<Course> courses =
                courseRepository.findAll(firstPageThreeRecords).getContent();
        Long totalElements =
                courseRepository.count();
        int totalPages = courseRepository.findAll(firstPageThreeRecords).getTotalPages();
        System.out.println("total number of pages" + totalPages);
        System.out.println("total element" + totalElements);
        System.out.println(courses);
    }
    @Test
    public void findAllSorting() {
        Pageable sortByTitle =PageRequest.of(0,1, Sort.by("title")) ;
        Pageable sortByCredit = PageRequest.of(0,1,Sort.by("credit").descending()) ;
        Pageable sortByTitleAndCreditDesc =PageRequest.of(0,1, Sort.by("title").and(Sort.by("credit").descending())) ;
        List<Course>courses = courseRepository.findAll(sortByTitle).getContent();
        System.out.println(courses);
    }
    @Test
    public void printFindByTitleContaining(){
        Pageable firstPageTenRecord=PageRequest.of(0,10);
        List<Course> courses=courseRepository.findByTitleContaining("D",firstPageTenRecord).getContent() ;
        System.out.println(courses);

    }
    @Test
    public void saveCourseWithStudentAndTeacher(){

        Teacher teacher=Teacher.builder().
                firstname("Dronacharya").lastname("kulguru").build();
        Student student= Student.builder().firstName("arjun").lastName("yadav").emailId("arjun@gmail.com").build();
        Course course=Course.builder().title("AI").
                credit(4).teacher(teacher).build();
    course.addStudents(student);
    courseRepository.save(course);
    }
}