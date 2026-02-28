#include <cstdlib>
#include <iostream>
#include <string>

int main() {
  const char* session_id_env = std::getenv("SESSION_ID");
  std::string session_id = session_id_env ? session_id_env : "(no SESSION_ID set)";

  std::cout << "Hello from Francis worker!" << std::endl;
  std::cout << "Session: " << session_id << std::endl;

  return 0;
}
