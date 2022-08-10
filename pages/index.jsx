import Head from "next/head"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Button, Form, Input } from "semantic-ui-react"
import { abi, contractAddress } from "../constants"

import styles from "../styles/Home.module.css"

export default function Home() {
    const [status, setStatus] = useState(false)
    const [minimumContribution, setMinimumContribution] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [balance, setBalance] = useState(0)

    useEffect(() => {})

    const connect = async () => {
        if (
            typeof window !== "undefined" &&
            typeof window.ethereum !== "underfined"
        ) {
            console.log("I see metamask")
            await window.ethereum.request({ method: "eth_requestAccounts" })
            setStatus(true)
        } else {
            console.log("No metamask")
        }
    }
    const fund = async (ethAmount) => {
        console.log(`funding with ${ethAmount}`)

        if (
            typeof window !== "undefined" &&
            typeof window.ethereum !== "underfined"
        ) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, abi, signer)
            try {
                const transactionResponse = await contract.fund({
                    value: ethers.utils.parseEther(ethAmount),
                })
                await listenForTrxMine(transactionResponse, provider)
                console.log("Done")
                setMinimumContribution("")
            } catch (error) {
                setErrorMessage(error.message)
            }
        } else {
            console.log("no wallet connected")
        }
    }
    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage("")
        fund(minimumContribution)
        setLoading(false)
    }

    const listenForTrxMine = (transactionResponse, provider) => {
        console.log(`Mining ${transactionResponse.hash}...`)
        return new Promise((resolve, reject) => {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} conformations`
                )
                resolve()
            })
        })
    }

    const getBalance = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const balance = await provider.getBalance(contractAddress)
            setBalance(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    }
    const withdraw = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, abi, signer)
            console.log("withdrawing...")
            const transactionResponse = await contract.withdraw()
            await listenForTrxMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Dapp FundMe</title>
                <meta name="description" content="hardhat-dapp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.button_connect}>
                <button onClick={connect}>
                    {status ? "Connected" : "Connect"}
                </button>
                <button onClick={getBalance}>get balance</button>
                <button onClick={withdraw}>withdraw</button>
            </div>

            <main className={styles.main}>
                <h1 className={styles.title}>Welcome to FundMe</h1>
                <p className={styles.title}>Current balance: {balance}</p>

                <div className={styles.grid}>
                    <Form onSubmit={onSubmit} error={!!errorMessage}>
                        <Form.Field>
                            <label>Funding</label>
                            <Input
                                value={minimumContribution}
                                onChange={(e) =>
                                    setMinimumContribution(e.target.value)
                                }
                                label="eth"
                                labelPosition="right"
                                placeholder="eth amount"
                            />
                        </Form.Field>
                        <Button type="submit" loading={loading}>
                            Fund
                        </Button>
                    </Form>
                    {/* <label htmlFor="fund">ETH amount</label>
                    <input type="text" id="ethAmount" placeholder="0.2" /> */}
                </div>
            </main>
        </div>
    )
}
