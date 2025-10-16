import psutil
import datetime
import subprocess

# Nombre del archivo de salida
archivo = "tareas_pc.txt"

# Obtener fecha y hora actual
ahora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

with open(archivo, "w", encoding="utf-8") as f:
    f.write(f"LISTADO DE TAREAS ACTIVAS ({ahora})\n")
    f.write("="*60 + "\n\n")

    for proc in psutil.process_iter(attrs=['pid', 'name', 'username', 'cpu_percent', 'memory_info']):
        try:
            info = proc.info
            nombre = info['name']
            pid = info['pid']
            usuario = info.get('username', 'N/A')
            cpu = info.get('cpu_percent', 0)
            memoria = info['memory_info'].rss / (1024 * 1024)  # en MB

            f.write(f"PID: {pid:<6} | CPU: {cpu:>5.1f}% | MEM: {memoria:>6.1f} MB | Usuario: {usuario} | Proceso: {nombre}\n")
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

print(f"✅ Se ha generado el archivo '{archivo}' con las tareas activas.\n")

# ===============================
# NUEVA FUNCIÓN: Insertar tarea
# ===============================
opcion = input("¿Deseas insertar una nueva tarea? (s/n): ").strip().lower()

if opcion == "s":
    tarea = input("👉 Ingresa el nombre o ruta del programa a ejecutar: ").strip()
    try:
        subprocess.Popen(tarea)  # Ejecuta la tarea
        print(f"✅ La tarea '{tarea}' se ha iniciado correctamente.")
    except FileNotFoundError:
        print(f"❌ No se encontró el programa '{tarea}'. Verifica la ruta o nombre.")
    except Exception as e:
        print(f"⚠️ Ocurrió un error al intentar iniciar la tarea: {e}")
else:
    print("👋 No se insertó ninguna tarea nueva.")
