const webPush = require('web-push')

webPush.setVapidDetails(
    `mailto:${process.env.WEB_PUSH_EMAIL}`,
    process.env.WEB_PUSH_PUBLIC_KEY,
    process.env.WEB_PUSH_PRIVATE_KEY
)

const notification = async (req, res) => {
    if (req.method !== 'POST' || !req.body) {
        res.status(400).json({
            message: 'wrong method'
        })
    }
    try {
        const { subscription, notificationContent } = req.body

        await webPush.sendNotification(subscription, JSON.stringify(notificationContent))

        res.status(200).json({
            message: 'notification recieved'
        })
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            message: err
        })
    }

    // if (req.method == 'POST') {
    //     const { subscription } = req.body

    //     webPush
    //         .sendNotification(subscription, JSON.stringify({ title: 'Hello Web Push', message: 'Your web push notification is here!' }))
    //         .then(response => {
    //             res.writeHead(response.statusCode, response.headers).end(response.body)
    //         })
    //         .catch(err => {
    //             if ('statusCode' in err) {
    //                 res.writeHead(err.statusCode, err.headers).end(err.body)
    //             } else {
    //                 console.error(err)
    //                 res.statusCode = 500
    //                 res.end()
    //             }
    //         })
    // } else {
    //     res.statusCode = 405
    //     res.end()
    // }
}

export default notification