using System;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        string password = "berni1";
        string hash = BCrypt.Net.BCrypt.HashPassword(password);
        Console.WriteLine(hash);
    }
}
