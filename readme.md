### QADS Backend ###

The backend will be build using a Modular Architecture which include the following folders :
src/
│
├── config/            (store configuration settings for external systems)
├── middlewares/       (run logic before request reaches controller)
├── utils/             (reusable helper functions)
├── docs/              (store API documentation files)
│
├── modules/
│   │
│   ├── auth/
│   │   ├── controllers/    (handle auth HTTP request and response)
│   │   ├── services/       (implement auth business logic)
│   │   ├── repositories/   (communicate with DB for auth-related data)
│   │   ├── models/         (define auth-related database structures)
│   │   ├── routes/         (define auth API endpoints)
│   │   └── validators/     (validate auth incoming request data)
│   │
│   ├── users/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   └── validators/
│   │
│   ├── campaigns/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   └── validators/
│   │
│   │
│   ├── wallet/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   └── validators/
│   │
│   ├── withdrawals/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   └── validators/
│   │
│   ├── notifications/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   └── validators/
│   │
│   └── admin/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       ├── routes/
│       └── validators/
│
├── app.js             (creates express app and loads middlewares and routes)
└── server.js          (starts server and listens on port)

