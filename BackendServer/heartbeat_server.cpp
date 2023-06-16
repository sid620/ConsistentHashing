#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <errno.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <sys/wait.h>
#include <arpa/inet.h>
#include <iostream>
#include<sstream>

using namespace std;

typedef void Sigfunc(int);

typedef struct
{
	int type;
	char c;
} my_msg;

Sigfunc* Signal(int signo, Sigfunc* func)
{
	struct sigaction act, oldact;

	act.sa_handler = func;
	sigemptyset(&act.sa_mask);
	act.sa_flags = 0;

	if (sigaction(signo, &act, &oldact) < 0)
		return SIG_ERR;

	return oldact.sa_handler;
}

void sig_child(int signo)
{
	pid_t pid;
	int stat;

	while ((pid = waitpid(-1, &stat, WNOHANG)) > 0)
		cout << "Child terminated with status: " << stat << endl;
}

void do_task(int connfd, struct sockaddr_in *cliaddr, socklen_t clilen)
{
	std::stringstream ss;
	ss << inet_ntoa(cliaddr->sin_addr)  << ":" << ntohs(cliaddr->sin_port) << ": ";
	auto prefix = ss.str();
	cout << prefix << "Connection established." << endl;

	while (true)
	{
		// read atmax 256 bytes from buffer
		char buff[256];
		int n = read(connfd, buff, 256);
		
		if (n < 0)
		{
			perror("read error");
			exit(-1);
		}

		if (n == 0)	// connection closed from client side
		{
			cout << prefix << "Connection closed from client." << endl;
			exit(0);
		}
	
		buff[n] = '\0';
		cout << prefix << "Data received: '" << buff << "'" << endl;
	}
}

int main(int argc, char** argv)
{
	int listenfd;
	struct sockaddr_in servaddr;

	if (argc != 2)
	{
		cout << "usage: server.o <PORT number>" << endl;
		exit(1);
	}

	// create the CLOSED state
	listenfd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

	if (listenfd < 0)
	{
		perror("socket error");
		exit(1);
	}

	// bind the server to PORT
	memset(&servaddr, 0, sizeof(servaddr));
	servaddr.sin_family = AF_INET;
	servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
	servaddr.sin_port = htons(atoi(argv[1]));

	if (bind(listenfd, (struct sockaddr*)&servaddr, sizeof(servaddr)) < 0)
	{
		perror("binding error");
		exit(1);
	}

	cout << "Listening to PORT " << ntohs(servaddr.sin_port) << "..." << endl;

	// move from CLOSED to LISTEN state, create passive socket
	if (listen(listenfd, 5) < 0)
	{
		perror("listen error");
		exit(1);
	}

	// Attach the signal handler
	
	Signal(SIGCHLD, sig_child);
	int connection_count = 0;

	// wait for connections
	while (true)
	{
		struct sockaddr_in cliaddr;
		socklen_t clilen = sizeof(cliaddr);
		int connfd;
		pid_t childpid;

		// do three way handshake
		if ((connfd = accept(listenfd, (struct sockaddr*)&cliaddr, &clilen)) < 0)
			if (errno == EINTR)
				continue;
			else
				perror("accept error");

		// fork and process
		if ((childpid = fork()) == 0)
		{
			close(listenfd);
			do_task(connfd, (struct sockaddr_in*)&cliaddr, clilen);
			exit(0);
		}

		close(connfd);
	}
}