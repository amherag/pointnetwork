let fs = require('fs')
let ethereumjs = require('ethereumjs-util')

class WalletController {
  constructor(ctx, req) {
    this.ctx = ctx;
    this.web3 = this.ctx.network.web3;
    this.keystorePath = this.ctx.wallet.keystore_path;
    this.walletToken = req.headers['wallet-token'];
    this.payload = req.body;
    this.wallet;
  }

  generate() {
    let account = this.web3.eth.accounts.create(this.web3.utils.randomHex(32))
    let wallet = this.web3.eth.accounts.wallet.add(account);

    let passcode = this.web3.utils.randomHex(32) // todo: improve entropy
    let keystore = wallet.encrypt(passcode);

    // write the encrypted wallet to disk
    fs.writeFileSync(`${this.keystorePath}/${keystore.id}`, JSON.stringify(keystore))

    // todo: remove
    this._fundWallet(account.address)

    return this._response({
      walletId: keystore.id,
      passcode
    })
  }

  async tx() {
    this._loadWallet()

    let to = this.payload.to
    let value = this.payload.value

    let receipt = await this.web3.eth.sendTransaction({from: this.wallet.address, to: to, value: value, gas: 21000})
    let transactionHash = receipt.transactionHash;

    return this._response({
      transactionHash
    })
  }

  publicKey() {
    this._loadWallet()

    let publicKeyBuffer = ethereumjs.privateToPublic(this.wallet.privateKey)
    let publicKey = ethereumjs.bufferToHex(publicKeyBuffer)

    // return the public key
    return this._response({
      publicKey
    })
  }

  async balance() {
    this._loadWallet()

    let balance = (await this.web3.eth.getBalance(this.wallet.address)).toString()

    // return the wallet balance
    return this._response({
      balance
    })
  }

  hash() {
    this._loadWallet()

    let partialPK = this.wallet.privateKey.substr(0, 33)
    let hashBuffer = ethereumjs.sha256(Buffer.from(partialPK))
    let hash = ethereumjs.bufferToHex(hashBuffer)

    return this._response({
      hash
    })
  }

  /* Private Functions */

  _validateWalletToken() {
    if(this.walletToken === undefined) {
      throw new Error('Missing wallet-token header.')
    }
    if(this.walletToken.length < 103) {
      throw new Error('wallet-token invalid.')
    }
  }

  _parseWalletToken() {
    this._validateWalletToken();
    this.walletId = this.walletToken.slice(0,36)
    this.passcode = this.walletToken.slice(37, 103)
  }

  _loadWallet() {
    this._parseWalletToken()
    // load the wallet from the keystore file
    // todo what if it does not exist?
    let keystoreBuffer = fs.readFileSync(`${this.keystorePath}/${this.walletId}`)
    let keystore = JSON.parse(keystoreBuffer)

    // decrypt it using the passcode
    let decryptedWallets = this.web3.eth.accounts.wallet.decrypt([keystore], this.passcode);

    let address = ethereumjs.addHexPrefix(keystore.address)

    this.wallet = decryptedWallets[address] // set the wallet using the address in the loaded keystore
  }

  // todo: remove
  _fundWallet(_address) {
    this.web3.eth.sendTransaction({from: this.ctx.wallet.network_account, to: _address, value: 1e18, gas: 21000})
  }

  _response(payload) {
    return {
      status: 200,
      data: payload
    }
  }
}

module.exports = WalletController;