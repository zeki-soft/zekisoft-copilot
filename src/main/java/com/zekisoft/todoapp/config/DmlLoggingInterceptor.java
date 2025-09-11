package com.zekisoft.todoapp.config;

import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.executor.parameter.ParameterHandler;
import org.apache.ibatis.executor.resultset.ResultSetHandler;
import org.apache.ibatis.executor.statement.StatementHandler;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.SqlCommandType;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.reflection.DefaultReflectorFactory;
import org.apache.ibatis.reflection.MetaObject;
import org.apache.ibatis.reflection.SystemMetaObject;
import org.springframework.stereotype.Component;

import java.sql.Statement;
import java.util.Properties;

@Component
@Intercepts({
    @Signature(type = StatementHandler.class, method = "update", args = {Statement.class}),
    @Signature(type = ResultSetHandler.class, method = "handleResultSets", args = {Statement.class})
})
public class DmlLoggingInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object target = invocation.getTarget();
        
        if (target instanceof StatementHandler) {
            return handleStatementExecution(invocation);
        } else if (target instanceof ResultSetHandler) {
            return handleResultSet(invocation);
        }
        
        return invocation.proceed();
    }
    
    private Object handleStatementExecution(Invocation invocation) throws Throwable {
        StatementHandler statementHandler = (StatementHandler) invocation.getTarget();
        MetaObject metaObject = MetaObject.forObject(statementHandler, 
            SystemMetaObject.DEFAULT_OBJECT_FACTORY, 
            SystemMetaObject.DEFAULT_OBJECT_WRAPPER_FACTORY, 
            new DefaultReflectorFactory());
        
        MappedStatement mappedStatement = (MappedStatement) metaObject.getValue("delegate.mappedStatement");
        SqlCommandType sqlCommandType = mappedStatement.getSqlCommandType();
        
        // Only log DML operations (INSERT, UPDATE, DELETE)
        if (sqlCommandType == SqlCommandType.INSERT || 
            sqlCommandType == SqlCommandType.UPDATE || 
            sqlCommandType == SqlCommandType.DELETE) {
            
            BoundSql boundSql = statementHandler.getBoundSql();
            Object parameterObject = boundSql.getParameterObject();
            
            System.out.println("=== DML Operation Log ===");
            System.out.println("SQL: " + formatSql(boundSql.getSql()));
            System.out.println("Parameters: " + formatParameters(parameterObject));
            
            // Execute the statement
            Object result = invocation.proceed();
            
            System.out.println("Processing Result: " + result + " rows affected");
            System.out.println("========================");
            
            return result;
        }
        
        return invocation.proceed();
    }
    
    private Object handleResultSet(Invocation invocation) throws Throwable {
        // For SELECT operations, we don't need special logging beyond parameters
        return invocation.proceed();
    }
    
    private String formatSql(String sql) {
        return sql.replaceAll("\\s+", " ").trim();
    }
    
    private String formatParameters(Object parameterObject) {
        if (parameterObject == null) {
            return "null";
        }
        return parameterObject.toString();
    }
    
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
    
    @Override
    public void setProperties(Properties properties) {
        // No properties to set
    }
}