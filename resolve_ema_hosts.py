#!/usr/bin/env python3
"""
EMA Hosts Resolver
-----------------
This script attempts to resolve EMA API hostnames to IP addresses
using multiple DNS resolution methods to overcome DNS resolution issues.
"""

import socket
import subprocess
import sys
import requests
import logging
import time
import json
from typing import Dict, List, Optional, Tuple

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("ema-resolver")

# EMA API hosts
EMA_HOSTS = [
    "spor-prod-bk.azure-api.net",
    "spor-dev-bk.azure-api.net",
    "spor-dev.azure-api.net",
    "spor-api.ema.europa.eu",
    "clinicaldata.ema.europa.eu"
]

# Public DNS over HTTPS services
DOH_SERVERS = [
    "https://cloudflare-dns.com/dns-query",
    "https://dns.google/resolve",
    "https://dns.quad9.net/dns-query"
]

def resolve_hostname_socket(hostname: str) -> Optional[str]:
    """Resolve hostname using socket.gethostbyname"""
    try:
        ip_address = socket.gethostbyname(hostname)
        logger.info(f"Socket resolved {hostname} to {ip_address}")
        return ip_address
    except socket.gaierror as e:
        logger.warning(f"Socket failed to resolve {hostname}: {e}")
        return None

def resolve_hostname_dig(hostname: str) -> Optional[str]:
    """Resolve hostname using dig command"""
    try:
        result = subprocess.run(
            ["dig", "+short", hostname], 
            capture_output=True, 
            text=True, 
            check=False
        )
        
        if result.returncode == 0 and result.stdout.strip():
            ip_address = result.stdout.strip().split("\n")[0]
            logger.info(f"Dig resolved {hostname} to {ip_address}")
            return ip_address
        else:
            logger.warning(f"Dig failed to resolve {hostname}")
            return None
    except Exception as e:
        logger.warning(f"Error using dig for {hostname}: {e}")
        return None

def resolve_hostname_nslookup(hostname: str) -> Optional[str]:
    """Resolve hostname using nslookup command"""
    try:
        result = subprocess.run(
            ["nslookup", hostname], 
            capture_output=True, 
            text=True, 
            check=False
        )
        
        if result.returncode == 0:
            # Parse nslookup output for IP address
            lines = result.stdout.strip().split("\n")
            for line in lines:
                if "Address:" in line and ":" in line:
                    ip_address = line.split(":", 1)[1].strip()
                    if ip_address != "":
                        logger.info(f"Nslookup resolved {hostname} to {ip_address}")
                        return ip_address
        
        logger.warning(f"Nslookup failed to resolve {hostname}")
        return None
    except Exception as e:
        logger.warning(f"Error using nslookup for {hostname}: {e}")
        return None

def resolve_hostname_doh(hostname: str) -> Optional[str]:
    """Resolve hostname using DNS over HTTPS"""
    for doh_server in DOH_SERVERS:
        try:
            if "cloudflare" in doh_server or "quad9" in doh_server:
                headers = {
                    "accept": "application/dns-json"
                }
                params = {
                    "name": hostname,
                    "type": "A"
                }
                response = requests.get(doh_server, headers=headers, params=params, timeout=5)
            elif "google" in doh_server:
                params = {
                    "name": hostname,
                    "type": "A"
                }
                response = requests.get(doh_server, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                if "Answer" in data:
                    for answer in data["Answer"]:
                        if answer.get("type") == 1:  # A record
                            ip_address = answer.get("data")
                            logger.info(f"DoH ({doh_server}) resolved {hostname} to {ip_address}")
                            return ip_address
            
            logger.warning(f"DoH ({doh_server}) failed to resolve {hostname}")
        except Exception as e:
            logger.warning(f"Error using DoH ({doh_server}) for {hostname}: {e}")
    
    return None

def resolve_hostname_public_api(hostname: str) -> Optional[str]:
    """Resolve hostname using public DNS API services"""
    try:
        # Try using public-apis.io
        url = f"https://dns.api.bz/query?name={hostname}&type=A"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("Answer"):
                for answer in data["Answer"]:
                    if answer.get("type") == 1:  # A record
                        ip_address = answer.get("data")
                        logger.info(f"Public API resolved {hostname} to {ip_address}")
                        return ip_address
        
        logger.warning(f"Public API failed to resolve {hostname}")
        return None
    except Exception as e:
        logger.warning(f"Error using public API for {hostname}: {e}")
        return None

def test_ip_connection(hostname: str, ip_address: str) -> bool:
    """Test connection to the IP address for the given hostname"""
    try:
        # Try to connect to the IP address with HTTPS
        url = f"https://{ip_address}"
        headers = {
            "Host": hostname,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=5, verify=False)
        logger.info(f"Connection to {ip_address} (host: {hostname}) returned status {response.status_code}")
        
        return response.status_code < 500  # Consider any non-server error as success
    except Exception as e:
        logger.warning(f"Failed to connect to {ip_address} (host: {hostname}): {e}")
        return False

def update_hosts_file(hostname_ip_map: Dict[str, str]) -> bool:
    """Update the /etc/hosts file with hostname to IP mappings"""
    try:
        hosts_entries = []
        for hostname, ip_address in hostname_ip_map.items():
            hosts_entries.append(f"{ip_address} {hostname}")
        
        hosts_content = "\n".join(hosts_entries)
        
        with open("ema_hosts_entries.txt", "w") as f:
            f.write(hosts_content)
        
        logger.info(f"Created hosts entries file with {len(hosts_entries)} entries")
        
        # Try to update /etc/hosts using sudo
        try:
            result = subprocess.run(
                ["sudo", "bash", "-c", f"cat ema_hosts_entries.txt >> /etc/hosts"],
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode == 0:
                logger.info("Successfully updated /etc/hosts file")
                return True
            else:
                logger.warning(f"Failed to update /etc/hosts: {result.stderr}")
        except Exception as e:
            logger.warning(f"Error updating /etc/hosts: {e}")
        
        # Alternative approach using python
        try:
            # Read current hosts file
            with open("/etc/hosts", "r") as f:
                current_hosts = f.read()
            
            # Append our entries
            new_hosts = current_hosts + "\n" + hosts_content
            
            # Write back
            with open("/etc/hosts", "w") as f:
                f.write(new_hosts)
            
            logger.info("Successfully updated /etc/hosts file using Python")
            return True
        except Exception as e:
            logger.warning(f"Error updating /etc/hosts with Python: {e}")
        
        return False
    except Exception as e:
        logger.error(f"Failed to update hosts file: {e}")
        return False

def main():
    """Main entry point"""
    print("\nEMA Hosts Resolver")
    print("=================\n")
    
    hostname_ip_map = {}
    resolution_methods = [
        resolve_hostname_socket,
        resolve_hostname_dig,
        resolve_hostname_nslookup,
        resolve_hostname_doh,
        resolve_hostname_public_api
    ]
    
    for hostname in EMA_HOSTS:
        print(f"\nResolving {hostname}:")
        print("-" * (10 + len(hostname)))
        
        resolved_ip = None
        
        # Try each resolution method until one succeeds
        for resolve_method in resolution_methods:
            method_name = resolve_method.__name__.replace("resolve_hostname_", "")
            print(f"  Trying {method_name}...")
            
            ip_address = resolve_method(hostname)
            if ip_address:
                print(f"  ✅ {method_name} resolved {hostname} to {ip_address}")
                resolved_ip = ip_address
                break
            else:
                print(f"  ❌ {method_name} failed to resolve {hostname}")
        
        if resolved_ip:
            print(f"  Testing connection to {resolved_ip}...")
            if test_ip_connection(hostname, resolved_ip):
                print(f"  ✅ Connection to {resolved_ip} (host: {hostname}) succeeded")
                hostname_ip_map[hostname] = resolved_ip
            else:
                print(f"  ❌ Connection to {resolved_ip} (host: {hostname}) failed")
        else:
            print(f"  ❌ Failed to resolve {hostname} with any method")
    
    print("\nResolution Summary:")
    print("==================")
    
    if hostname_ip_map:
        print(f"Successfully resolved {len(hostname_ip_map)} of {len(EMA_HOSTS)} hosts:")
        for hostname, ip in hostname_ip_map.items():
            print(f"  {hostname} -> {ip}")
        
        # Create hosts file entries
        print("\nCreating hosts file entries...")
        
        with open("ema_hosts.json", "w") as f:
            json.dump(hostname_ip_map, f, indent=2)
        
        print(f"✅ Saved hostname to IP mappings to ema_hosts.json")
        
        # Try to update hosts file
        if update_hosts_file(hostname_ip_map):
            print("✅ Updated hosts file with resolved IP addresses")
        else:
            print("❌ Failed to update hosts file")
            print("Here are the entries to add to your hosts file manually:")
            for hostname, ip in hostname_ip_map.items():
                print(f"{ip} {hostname}")
    else:
        print("❌ Failed to resolve any EMA hosts")

if __name__ == "__main__":
    main()