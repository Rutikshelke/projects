package com.xadmin.SpringBootcrud.sevice;

import com.xadmin.SpringBootcrud.bean.Subject;
import com.xadmin.SpringBootcrud.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SubjectService {
    @Autowired
    public SubjectRepository subjectRepo ;
    public List<Subject>getAllSubjects(){
        List<Subject> subject = new ArrayList<>();
        subjectRepo.findAll().forEach(subject ::add);
        return subject;

    }

    public void addsubject(Subject subject) {
        subjectRepo.save(subject);
    }

    public void updatesubject(String id, Subject subject) {
        subjectRepo.save(subject) ;
    }

    public void deletesubject(String id) {
        subjectRepo.deleteById(id);
    }
}
