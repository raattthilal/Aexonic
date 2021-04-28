npm install

npm start
    (User-microservice start in port 5000)


APIs
------


1) Register user
POST - method
http://localhost:5000/user/register

body:{
      "firstname":"zx",
      "lastname":"xz",
      "email"    : "xx",
      "password" : "yy",
      "phone":"12121212",
      "address":"sdsa"
    }

2)Login 
POST - method
http://localhost:5000/user/authenticate

body:{
      "email"    : "xx" ,
      "password" : "yy"
    }


3)List Users
GET - method ( Authtoken )
http://localhost:5000/user/list ? page=0 & limit=10


4)Update Users
PUT - method ( Authtoken )
http://localhost:5000/user/update/:id

body:{
      "firstname":"zx",
      "lastname":"xz",
      "email"    : "xx",
      "phone":"12121212",
      "address":"sdsa"
    }

4)Search API
GET - method ( Authtoken )
http://localhost:5000/user/search ? keyword = xx & page=0 & limit=10
