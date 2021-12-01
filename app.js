import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sessions from 'express-session';
import MsIdExpress from 'microsoft-identity-express'

import indexRouter from './routes/index.js';
// import usersRouter from './routes/users.js';
import apiv1 from './routes/apiv1.js'
import apiv2 from './routes/v2/apiv2.js'
import apiv3 from './routes/v3/apiv3.js'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appSettings = {
    appCredentials: {
        clientId: "d31bc02c-1923-44f9-b550-803b7ab0c4b6",
        tenantId: "f6b6dd5b-f02f-441a-99a0-162ac5060bd2",
        clientSecret: "UE47Q~pVxLoguh9fAJe.J.yzoxj8g6MSgZbwM"
    },
    authRoutes: {
        redirect: "/redirect",
        error: "/error",
        unauthorized: "/unauthorized"
    }
}

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const oneDay = 1000* 60 * 60 * 24;
app.use(sessions({
    secret:"dafadafhahadg8234noadjhoi53",
    saveUnitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}))
const msid = new MsIdExpress.WebAppAuthClientBuilder(appSettings).build()
app.use(msid.initialize());
app.get('/signin', 
    msid.signIn({
        postLoginRedirect: '/'
    }
));

app.get('/signout', 
    msid.signOut({
        postLogoutRedirect: '/'
    }
));

app.get('/error', (req, res) => res.status(500).send('server error'));
app.get('/unauthorized', (req, res) => res.status(401).send('Permission denied'));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/api/v1', apiv1);
app.use('/api/v2', apiv2)
app.use('/api/v3',apiv3)
app.get('/signin',
    msid.signIn
)
export default app;
