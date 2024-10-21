package com.xadmin.SpringBootcrud.controller;

import com.xadmin.SpringBootcrud.bean.Subject;
import com.xadmin.SpringBootcrud.sevice.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SubjectController {
    @Autowired
    private SubjectService subjectService;
@RequestMapping("/subject")
    public List<Subject> getAllSubjects() {
        return subjectService.getAllSubjects() ;
    }
    @RequestMapping(method = RequestMethod.POST,value = "/subject")
    public  void addsubjects(@RequestBody Subject subject){
    subjectService.addsubject(subject);

    }
    @RequestMapping(method = RequestMethod.PUT,value = "/subject/{id}")
    public  void updatesubjects(@PathVariable String id ,@RequestBody Subject subject){
        subjectService.updatesubject(id,subject) ;
    }
  @DeleteMapping ("/subject/{id}")
    public  void deletesubject(@PathVariable String id ){
        subjectService.deletesubject(id);


    }
}
