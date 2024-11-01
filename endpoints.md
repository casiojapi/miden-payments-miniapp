# get todos los usernames registrados
GET -> /api/usernames       
response {
    usernames: [username_n: string]
}


# crear account
POST -> /api/account/create/

request { 
    user_id: string,
    username: string
}

response {
    user_id: string,
	username: string,
	balance: string,
	address: string
}

# get account details
GET -> /api/account/${userId}

response {
    user_id: string,
	username: string,
	balance: string,
	address: string
}


# get account transaction history (array de todos los cambios de balance de la cuenta, entradas y salidas)
GET -> /api/account/${username}/transactions

response {
    transactions: [
        tx: {
            sender_username: string,
            receiver_username: string,
            amount: string,
            timestamp: string,
            type: string
        }
    ]
}


# send amount
/api/transactions/send
{
    sender_username,
    receiver_username, 
    amount
}


