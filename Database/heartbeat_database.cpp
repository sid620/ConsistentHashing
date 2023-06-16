#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <time.h>
#include <errno.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <iostream>
#include <sstream>

using namespace std;

void do_task(int sockfd)
{
	int n;
	char BUFF[2];
	BUFF[1] = '\0';

	for (int i = 0; i < 10; ++i)
	{
		cout << "Preparing Data..." << endl;
		sleep(2);		// sleep for 1 second
		BUFF[0] = 'A' + i;

		cout << "Sending: " << BUFF << endl;
		n = write(sockfd, BUFF, 2);

		if (n < 0)
		{
			perror("write error");
			exit(-1);
		}
	}

	cout << "Success" << endl;
}

int main(int argc, char** argv)
{
	int sockfd;
	struct sockaddr_in servaddr;

	if (argc != 3)
	{
		cout << "usage: heartbeat_database.o <IPaddress> <PORT>" << endl;
		exit(1);
	}

	cout << "Entered: heartbeat_database.o " << argv[1] << " " << argv[2] << endl;
	// create socket in CLOSED state
	sockfd = socket(AF_INET, SOCK_STREAM, 0);

	// get IP address from URL
	struct hostent* hostinfo = gethostbyname(argv[1]);
	while (hostinfo == NULL)
	{
		cout << "gethostbyname error for host: " << hostinfo << ": " << hstrerror(h_errno) << endl;
		exit(-1);
	}

	// fill the server details
	memset(&servaddr, 0, sizeof(servaddr));
	servaddr.sin_family = AF_INET;
	servaddr.sin_port = htons(atoi(argv[2]));
	memcpy(&servaddr.sin_addr, *(struct in_addr**)hostinfo->h_addr_list, sizeof(struct in_addr));


	// perform three way handshake
	if (connect(sockfd, (struct sockaddr*)&servaddr, sizeof(servaddr)) < 0)
	{
		perror("3. connect error");
		exit(1);
	}

	do_task(sockfd);
	close(sockfd);

	return 0;
}