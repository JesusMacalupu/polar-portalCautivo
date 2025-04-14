import subprocess
import re
import platform
import sys
import json
import socket
import concurrent.futures

def obtener_nombre_dispositivo(ip):
    """Intenta resolver el nombre del host con timeout"""
    try:
        return socket.gethostbyaddr(ip)[0] 
    except (socket.herror, socket.gaierror, socket.timeout):
        return ip  # Devuelve la IP si no se puede resolver el nombre

def obtener_dispositivos_windows():
    """Escanea la red en Windows usando arp -a (rápido)"""
    dispositivos = []
    try:
        resultado_arp = subprocess.run("arp -a", shell=True, capture_output=True, text=True, timeout=3)
        if resultado_arp.returncode != 0:
            return dispositivos
            
        for linea in resultado_arp.stdout.split("\n"):
            if re.search(r"\d+\.\d+\.\d+\.\d+", linea):
                datos = re.split(r"\s+", linea.strip())
                if len(datos) >= 3:
                    ip = datos[0]
                    mac = datos[1].replace("-", ":").upper()
                    dispositivos.append({
                        'nombre': ip,  # La resolución del nombre se hará en paralelo después
                        'ip': ip,
                        'mac': mac,
                        'estado': 'conectado'
                    })
    except Exception as e:
        print(f"⚠️ Error en Windows: {str(e)}", file=sys.stderr)
    return dispositivos

def obtener_dispositivos_linux():
    """Escanea la red en Linux usando arp-scan (más rápido que nmap)"""
    dispositivos = []
    try:
        resultado = subprocess.run(
            "sudo arp-scan --localnet --quiet --ignoredups",
            shell=True,
            capture_output=True,
            text=True,
            timeout=3
        )
        
        if resultado.returncode != 0:
            print("⚠️ Ejecuta con sudo o instala arp-scan: sudo apt install arp-scan", file=sys.stderr)
            return dispositivos
            
        for linea in resultado.stdout.split("\n"):
            match = re.match(r"^([\d.]+)\s+([0-9a-fA-F:]+)\s+(.+)$", linea)
            if match:
                ip, mac, _ = match.groups()
                dispositivos.append({
                    'nombre': ip,  # La resolución del nombre se hará en paralelo después
                    'ip': ip,
                    'mac': mac.upper(),
                    'estado': 'conectado'
                })
    except Exception as e:
        print(f"⚠️ Error en Linux: {str(e)}", file=sys.stderr)
    return dispositivos

def resolver_nombres(dispositivos):
    """Resuelve los nombres de host en paralelo para mayor velocidad"""
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for dispositivo in dispositivos:
            if dispositivo['nombre'] == dispositivo['ip']:  # Solo resolver si no tenemos nombre
                futures.append(
                    executor.submit(obtener_nombre_dispositivo, dispositivo['ip'])
                )
            else:
                futures.append(None)
        
        for i, future in enumerate(futures):
            if future is not None:
                try:
                    dispositivos[i]['nombre'] = future.result(timeout=1)
                except:
                    pass 
    return dispositivos

def escanear_red():
    """Ejecuta el escaneo según el sistema operativo"""
    sistema = platform.system()
    if sistema == "Windows":
        dispositivos = obtener_dispositivos_windows()
    elif sistema == "Linux":
        dispositivos = obtener_dispositivos_linux()
    else:
        print("⚠️ Sistema no compatible.", file=sys.stderr)
        return []
    return resolver_nombres(dispositivos)

if __name__ == '__main__':
    print(json.dumps(escanear_red(), indent=4))
