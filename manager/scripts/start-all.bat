@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================
:: 一键启动所有前端项目 (Windows CMD 版本)
:: 使用方式: scripts\start-all.bat
:: ============================================

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."

:: 日志目录
set "LOGS_DIR=%ROOT_DIR%\logs"
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

echo ========================================
echo        一键启动所有前端项目
echo ========================================
echo.

:: 检查并安装依赖
echo [Step 1] 检查依赖...
echo.

:: Manager
if not exist "%ROOT_DIR%\node_modules" (
    echo [manager] 检测到未安装依赖，正在安装...
    cd /d "%ROOT_DIR%"
    call npm install
    if errorlevel 1 (
        echo [manager] 依赖安装失败！
    ) else (
        echo [manager] 依赖安装完成
    )
)

:: Admin
if not exist "%ROOT_DIR%\..\projects\gas\admin\node_modules" (
    echo [admin] 检测到未安装依赖，正在安装...
    cd /d "%ROOT_DIR%\..\projects\gas\admin"
    call npm install
    if errorlevel 1 (
        echo [admin] 依赖安装失败！
    ) else (
        echo [admin] 依赖安装完成
    )
)

:: Miniprogram
if not exist "%ROOT_DIR%\..\projects\gas\miniprogram\node_modules" (
    echo [miniprogram] 检测到未安装依赖，正在安装...
    cd /d "%ROOT_DIR%\..\projects\gas\miniprogram"
    call npm install
    if errorlevel 1 (
        echo [miniprogram] 依赖安装失败！
    ) else (
        echo [miniprogram] 依赖安装完成
    )
)

echo.
echo [Step 2] 启动项目...
echo.

:: 启动 Manager
echo [manager] 正在启动... (端口: 3000)
cd /d "%ROOT_DIR%"
start "manager" cmd /c "npm run dev > %LOGS_DIR%\manager.log 2>&1"
timeout /t 2 /nobreak >nul

:: 启动 Admin
echo [admin] 正在启动... (端口: 3002)
cd /d "%ROOT_DIR%\..\projects\gas\admin"
start "admin" cmd /c "npm run dev > %LOGS_DIR%\admin.log 2>&1"
timeout /t 2 /nobreak >nul

:: 启动 Miniprogram
echo [miniprogram] 正在启动... (端口: 3001)
cd /d "%ROOT_DIR%\..\projects\gas\miniprogram"
start "miniprogram" cmd /c "npm run dev:h5 > %LOGS_DIR%\miniprogram.log 2>&1"

echo.
echo ========================================
echo 所有项目启动完成！
echo ========================================
echo.
echo 访问地址:
echo   Manager:      http://localhost:3000
echo   Admin:        http://localhost:3002
echo   Miniprogram:  http://localhost:3001
echo.
echo 日志目录: %LOGS_DIR%
echo.

:: 返回原目录
cd /d "%ROOT_DIR%"
