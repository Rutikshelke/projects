package com.DailyCodeBuffer.projectforjpa_Tutorial.Repository;

import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Course;
import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.CourseMaterial;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

//import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
class CourseMaterialRepositoryTest {
    @Autowired
private CourseMaterialRepository repository;
    @Test
    public  void saveCourseMaterial()
    {
        Course course=Course.builder().credit(6).title("DSA").build();
        CourseMaterial courseMaterial = CourseMaterial.builder().course(course).url("www.coursematerial.com").build();
        repository.save(courseMaterial)       ; }
    @Test
    public void  printAllCourseMaterial(){
        List<CourseMaterial>courseMaterials=repository.findAll();
        System.out.println(courseMaterials);


    }
}