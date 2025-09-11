package com.zekisoft.todoapp.repository;

import com.zekisoft.todoapp.model.Todo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TodoRepositoryTest {

    @Autowired
    private TodoRepository todoRepository;

    @Test
    public void testInsertTodo() {
        // Create a new Todo
        Todo todo = new Todo("Test Todo");
        
        // Save the Todo - this should trigger DML logging
        Todo savedTodo = todoRepository.save(todo);
        
        // Verify the todo was saved
        assertNotNull(savedTodo);
        assertNotNull(savedTodo.getId());
        assertEquals("Test Todo", savedTodo.getTitle());
        assertNotNull(savedTodo.getCreatedAt());
    }

    @Test
    public void testFindAllTodos() {
        // Insert a test todo first
        Todo todo = new Todo("Test Todo for Select");
        todoRepository.save(todo);
        
        // Retrieve all todos
        List<Todo> todos = todoRepository.findAllByOrderByCreatedAtDesc();
        
        // Verify we got results
        assertNotNull(todos);
        assertFalse(todos.isEmpty());
    }

    @Test
    public void testUpdateTodo() {
        // Create and save a new Todo
        Todo todo = new Todo("Original Title");
        Todo savedTodo = todoRepository.save(todo);
        
        // Update the todo
        savedTodo.setTitle("Updated Title");
        Todo updatedTodo = todoRepository.save(savedTodo);
        
        // Verify the update
        assertNotNull(updatedTodo);
        assertEquals("Updated Title", updatedTodo.getTitle());
        assertEquals(savedTodo.getId(), updatedTodo.getId());
    }
}