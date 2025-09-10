package com.zekisoft.todoapp.controller;

import com.zekisoft.todoapp.model.Todo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private static final String TODOS_SESSION_KEY = "todos";
    private static final String ID_COUNTER_SESSION_KEY = "idCounter";

    @GetMapping
    public List<Todo> getAllTodos(HttpSession session) {
        List<Todo> todos = (List<Todo>) session.getAttribute(TODOS_SESSION_KEY);
        if (todos == null) {
            todos = new ArrayList<>();
            session.setAttribute(TODOS_SESSION_KEY, todos);
        }
        return todos;
    }

    @PostMapping
    public ResponseEntity<Todo> addTodo(@RequestBody Todo todo, HttpSession session) {
        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String title = todo.getTitle().trim();
        if (title.length() > 20) {
            return ResponseEntity.badRequest().build();
        }

        List<Todo> todos = getAllTodos(session);
        
        // Get and increment ID counter
        AtomicLong idCounter = (AtomicLong) session.getAttribute(ID_COUNTER_SESSION_KEY);
        if (idCounter == null) {
            idCounter = new AtomicLong(0);
            session.setAttribute(ID_COUNTER_SESSION_KEY, idCounter);
        }
        
        Long newId = idCounter.incrementAndGet();
        Todo newTodo = new Todo(newId, title);
        todos.add(newTodo);
        
        return ResponseEntity.ok(newTodo);
    }
}