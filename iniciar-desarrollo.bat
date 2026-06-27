@echo off
echo === INICIANDO SISTEMA RESCATE VENEZUELA (DESARROLLO) ===

echo Iniciando backend en nueva ventana...
start "Backend - Rescate" cmd /k "cd backend && npm run start:dev"

timeout /t 5 /nobreak > nul

echo Iniciando frontend en nueva ventana...
start "Frontend - Rescate" cmd /k "cd frontend && npm run dev"

echo.
echo Sistema iniciado:
echo   Backend API:  http://localhost:3000/api
echo   Swagger:      http://localhost:3000/api/docs
echo   Frontend:     http://localhost:5173
echo.
echo Usuarios:
echo   admin / Admin2024!
echo   rescatista1 / Rescate2024!
echo   hospital1 / Hospital2024!
echo.
pause
