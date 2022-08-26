
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from "./utils/load-contract";



function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null
  })

  const [balance, setBallance] = useState(null)
  const [account, setAccount] = useState(null)
  const [shouldReload, reload] = useState(false)

  const canConnectToContract = account && web3Api.contract
  const reloadEffect = useCallback(() => reload(!shouldReload), [shouldReload])

  const setAccountListener = provider => {
    provider.on("accountsChanged", _ => window.location.reload())
    provider.on("chainChanged", _ => window.location.reload())
  }

  useEffect(() => {
    const loadProvider = async () => {
      // with metamask we have an access to window.ethereum & to window.web3
      // metamaks injects a global API into websites
      // this API will allow websites to request users, accounts, ...
      // sing messages and transactrions
      const provider = await detectEthereumProvider()

      if (provider) {
        const contract = await loadContract("Faucet", provider)
        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider, 
          contract,
          isProviderLoaded: true
        })
      } else {
        setWeb3Api((api) => {
          return {
            ...api,
            isProviderLoaded: true
          }
        })
        console.error("Please, install Metamask...")
      }
    }

    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } =web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBallance(web3.utils.fromWei(balance,"ether"))
    }

    web3Api.contract && loadBalance()
  }, [web3Api, shouldReload])

  useEffect(() => {
    const  getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }

    web3Api.web3 && getAccount()
  }, [web3Api.web3])

  const addFunds = useCallback(async() => {
    const { contract, web3 } = web3Api
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    })

    // window.location.reload() - nice way to reload the page after the tx
    reloadEffect()
  }, [web3Api, account, reloadEffect])

  const withdrawFunds = async () => {
    const { contract, web3 } = web3Api
    const withdrawAmount = web3.utils.toWei("0.1", "ether")
    await contract.withdraw(withdrawAmount, {
      from:account
    })

    reloadEffect()
  }

  return (
    <>
      <div className="faucet-wrapper has-background-link-light">
        <div className="faucet">
          { web3Api.isProviderLoaded ? 
            <div className="is-flex is-align-items-center">
              <span>
                <strong className="mr-2">Account: </strong>
              </span>
                { account ?
                  <div>{account}</div> :
                  !web3Api.provider ?
                  <>
                    <div className="notification is-warning is-light is-size-7 is-rounded">
                      Wallet is not detected!{` `}
                      <a target="_blank" href="https://docs.metamask.io" rel="noreferrer">
                        Install Metamask
                      </a>
                    </div>
                  </> :
                  <button 
                  className="button is-info is-outlined is-small"
                  onClick={() => 
                    web3Api.provider.request({method: "eth_requestAccounts"}
                    )}
                  >
                    Connect Wallet
                  </button>
                }
            </div> :
            <span>Looking for Web3...</span>
          }
          <div className="balance-view is-size-2">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
            { !canConnectToContract &&
            <i className="is-block">
              Connect to Ropsten test Network
            </i>
            }
          <button
          disabled={!canConnectToContract}
          className="button mr-2 is-link is-outlined"
          onClick={addFunds}
          >Donate 1 ETH</button>
          <button className="button is-primary is-outlined"
          onClick={withdrawFunds}
          disabled={!canConnectToContract}>Withdraw 0.1 ETH</button> 
        </div>
      </div>
    </>    
  );
}

export default App;
