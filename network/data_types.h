#pragma once
#include <arpa/inet.h>
#include <string>
#include <stdexcept>

namespace Network
{
    enum class ByteOrder
    {
        NETWORK,
        HOST
    };

    class IP
    {
        const uint32_t ip4_n;
    public:
        IP(uint32_t value = 0, ByteOrder order = ByteOrder::NETWORK);
        IP(std::string_view value);

        uint32_t get_ip(ByteOrder order) const;

        operator std::string() const
        {
            char str[INET_ADDRSTRLEN];
            inet_ntop(AF_INET, &ip4_n, str, INET_ADDRSTRLEN);
            return std::string(str);
        }

        bool operator==(const IP &other) const
        {
            return ip4_n == other.ip4_n;
        }

        bool operator!=(const IP& other) const
        {
            return ip4_n != other.ip4_n;
        }
    };

    class PORT
    {
        
    };
}