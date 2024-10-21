package com.DailyCodeBuffer.projectforjpa_Tutorial.Repository;

import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CourseRepository extends JpaRepository<Course,Long> {

    Page<Course> findAll(Pageable firstPageThreeRecord);
    Page<Course>findByTitleContaining(String title, Pageable pageable);
}
