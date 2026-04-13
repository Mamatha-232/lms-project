@echo off
set MAVEN_OPTS=-Xmx512m
set WRAPPER_JAR=".mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

if not exist %WRAPPER_JAR% (
    mkdir ".mvn\wrapper" 2>nul
    powershell -Command "Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR%"
)

java -jar %WRAPPER_JAR% %*
