package com.zekisoft.todoapp.controller;

import com.zekisoft.todoapp.model.Issue;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private static final String ISSUES_SESSION_KEY = "issues";
    private static final String ISSUE_ID_COUNTER_SESSION_KEY = "issueIdCounter";

    @GetMapping
    public List<Issue> getAllIssues(HttpSession session) {
        List<Issue> issues = (List<Issue>) session.getAttribute(ISSUES_SESSION_KEY);
        if (issues == null) {
            issues = new ArrayList<>();
            session.setAttribute(ISSUES_SESSION_KEY, issues);
        }
        return issues;
    }

    @PostMapping
    public ResponseEntity<Issue> addIssue(@RequestBody Issue issue, HttpSession session) {
        if (issue.getTitle() == null || issue.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<Issue> issues = getAllIssues(session);
        
        // Get and increment ID counter
        AtomicLong idCounter = (AtomicLong) session.getAttribute(ISSUE_ID_COUNTER_SESSION_KEY);
        if (idCounter == null) {
            idCounter = new AtomicLong(0);
            session.setAttribute(ISSUE_ID_COUNTER_SESSION_KEY, idCounter);
        }
        
        Long newId = idCounter.incrementAndGet();
        Issue newIssue = new Issue(newId, issue.getTitle().trim(), 
                                  issue.getDescription() != null ? issue.getDescription().trim() : "",
                                  issue.getPriority());
        issues.add(newIssue);
        
        return ResponseEntity.ok(newIssue);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Issue> updateIssueStatus(@PathVariable Long id, @RequestBody Issue updateRequest, HttpSession session) {
        List<Issue> issues = getAllIssues(session);
        
        for (Issue issue : issues) {
            if (issue.getId().equals(id)) {
                if (updateRequest.getStatus() != null) {
                    issue.setStatus(updateRequest.getStatus());
                }
                return ResponseEntity.ok(issue);
            }
        }
        
        return ResponseEntity.notFound().build();
    }
}