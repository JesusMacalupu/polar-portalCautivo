from scapy.all import ARP, Ether, srp

def scan_network(network="192.168.1.0/24"):
    arp = ARP(pdst=network)
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = ether/arp
    result = srp(packet, timeout=3, verbose=0)[0]
    return len(result)

if __name__ == "__main__":
    count = scan_network()
    print(count)  
