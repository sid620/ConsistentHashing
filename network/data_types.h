#pragma once
#include <arpa/inet.h>
#include <string>
#include <stdexcept>

namespace Network
{
    template<typename T>
    struct is_raw_string
            : public std::disjunction<
                    std::is_same<char *, std::remove_cvref_t<T>>,
                    std::is_same<const char *, std::remove_cvref_t<T>>
            > {};

    template<typename T>
    struct is_string
            : public std::disjunction<
                    is_raw_string<T>,
                    std::is_same<std::string, std::remove_cvref_t<T>>
            > {};
    
    enum class IPType
    {
        NETWORK_ORDER_IP4,
        HOST_ORDER_IP4,
        STRING_IP4
    };

    class IP
    {
        const uint32_t ip4_n;
        IP(uint32_t &value) : ip4_n {value} { }
        
    public:
        template <IPType Type>
        static IP Create(auto value);

        uint32_t get_network_order() const
        {
            return ip4_n;
        }

        uint32_t get_host_order() const
        {
            return ntohl(ip4_n);
        }

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
            return ip4_n == other.ip4_n;
        }
    };

    template <IPType Type>
    IP IP::Create(auto value)
    {
        constexpr auto is_network_order = Type == IPType::NETWORK_ORDER_IP4;
        constexpr auto is_host_order = Type == IPType::HOST_ORDER_IP4;
        constexpr auto is_string = Type == IPType::STRING_IP4;
        constexpr auto is_value_uint32_t = std::is_integral<std::remove_cvref_t<decltype(value)>>::value;
        constexpr auto is_value_str = Network::is_string<decltype(value)>::value;

        static_assert((is_network_order && is_value_uint32_t) || (is_host_order && is_value_uint32_t) || (is_string && is_value_str), "Incompatible IP format");

        if constexpr (is_network_order)
            return IP(value);

        if constexpr (is_host_order)
            return IP(htonl(value));

        if constexpr (is_string)
        {
            uint32_t ip;
            uint32_t res;

            if constexpr (Network::is_raw_string<decltype(value)>::value)
                res = inet_pton(AF_INET, value, &ip);
            else
                res = inet_pton(AF_INET, value.c_str(), &ip);

            if (res == 0)
                throw std::runtime_error("IP address doesn't belong to IPv4 family");
            else if (res == -1)
                throw std::runtime_error("Invalid IP address");
            
            return IP(ip);
        }
        
        throw std::runtime_error("Incompatible IP format");
    }
}