#include "data_types.h"
#include <string_view>
#include <string.h>
#include <cassert>

uint32_t get_ip_n(std::string_view value)
{
    uint32_t ip;
    switch (inet_pton(AF_INET, value.data(), &ip))
    {
        case 0:
            throw std::runtime_error("IP address doesn't belong to IPv4 family");
        case -1:
            throw std::runtime_error("Invalid IP address");
    }
    
    return ip;
}

namespace Network
{
    IP::IP(std::string_view value) : ip4_n {get_ip_n(value)}
    {

    }

    IP::IP(uint32_t value, ByteOrder order) : ip4_n 
    { 
        order == ByteOrder::NETWORK ? value : htonl(value)
    }{ }

    uint32_t IP::get_ip(ByteOrder order) const
    {
        return order == ByteOrder::NETWORK ? ip4_n : ntohl(ip4_n);
    }
}