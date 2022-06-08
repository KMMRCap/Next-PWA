import React, { useEffect, useState } from 'react'
import Head from 'next/head'

export const getServerSideProps = async () => {

  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY

  return {
    props: { publicKey }
  }
}

const Landing = ({ publicKey }) => {

  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [registration, setRegistration] = useState(null)

  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('Hello Web Push')
  const [message, setMessage] = useState('Your web push notification is here')

  const [pushed, setPushed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setLoading(true)
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
            setSubscription(sub)
            setIsSubscribed(true)
            setLoading(false)
          }
          else {
            setLoading(false)
          }
        })
        setRegistration(reg)
      })
    }
  }, [])

  const handleSubscribe = async (event) => {
    event.preventDefault()
    setLoading(true)

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey)
    })

    setSubscription(sub)
    setIsSubscribed(true)
    setLoading(false)
  }

  const handleUnsubscribe = async (event) => {
    event.preventDefault()
    setLoading(true)

    await subscription.unsubscribe()

    setSubscription(null)
    setIsSubscribed(false)
    setLoading(false)
  }

  const handleSendNotification = async (event) => {
    event.preventDefault()
    if (!title || !message) {
      return
    }
    const res = await fetch('/api/notification', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ subscription, notificationContent: { title, message } })
    })
    if (res.ok) {
      navigator.vibrate([100,100,100])
      setPushed(true)
      setTimeout(() => {
        setPushed(false)
      }, 5000);
    }
  }

  return (
    <>
      <Head>
        <title>Next PWA</title>
      </Head>
      <h1 style={styles.h1}>Next PWA</h1>
      <hr style={styles.hr} />
      {loading ?
        <h3 style={styles.h3}>Loading ...</h3>
        :
        <>
          <h3 style={styles.h3}>
            {isSubscribed ? "You are subscribed" : "You are not subscribed"}
          </h3>
          <div style={styles.container}>
            {!isSubscribed ?
              <button onClick={handleSubscribe} style={styles.button}>Subscribe</button>
              :
              <>
                <button onClick={handleUnsubscribe} style={styles.button}>UnSubscribe</button>
                <hr style={styles.hr} />
                <div style={styles.container}>
                  <h3 style={styles.h3}>
                    Admin Panel Here
                  </h3>
                  <p style={styles.h3}>Notificaton data :</p>
                  <div style={styles.cont}>
                    <input
                      style={styles.input}
                      type='text'
                      placeholder='Title'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                      style={styles.input}
                      type='text'
                      placeholder='Description'
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <button onClick={handleSendNotification} style={styles.button}>Push Notification</button>
                  {pushed &&
                    <h3 style={styles.p}>
                      Notification Pushed
                      <br />
                      Check Your Notifications
                    </h3>
                  }
                </div>
              </>
            }

          </div>
        </>
      }
    </>
  )
}

export default Landing



const base64ToUint8Array = (base64String) => {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const styles = {
  h1: {
    textAlign: 'center',
    margin: '2rem 0'
  },
  h3: {
    textAlign: 'center',
    margin: '3rem 0 0'
  },
  container: {
    textAlign: 'center',
  },
  button: {
    padding: '5px 20px',
    margin: '2rem 10px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  hr: {
    margin: '3rem 0'
  },
  cont: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  input: {
    margin: '0 1rem',
    padding: '5px 10px',
    width: '50%',
    margin: '1rem 0 0'
  }
}