let fs = require('fs')
let ethereumjs = require('ethereumjs-util')

class WalletController {
  constructor(ctx, req) {
    this.ctx = ctx;
    this.web3 = this.ctx.network.web3;
    this.walletToken = req.headers['wallet-token'];
    this._validateWalletToken();
    this.walletId = this.walletToken.slice(0,36)
    this.passcode = this.walletToken.slice(37, 103)
    this.keystorePath = this.ctx.wallet.keystore_path;
    this.wallet;
  }

  generate() {
    let account = this.web3.eth.accounts.create(this.web3.utils.randomHex(32))
    let wallet = this.web3.eth.accounts.wallet.add(account);
    let passcode = this.web3.utils.randomHex(32) // todo: improve entropy
    let keystore = wallet.encrypt(passcode);

    // todo set file path from config
    fs.writeFileSync(`${this.keystorePath}/${keystore.id}`, JSON.stringify(keystore))

    return {
      walletId: keystore.id,
      passcode
    }
  }

  publicKey() {
    this._loadWallet()

    let publicKeyBuffer = ethereumjs.privateToPublic(this.wallet[0].privateKey)
    let publicKey = ethereumjs.bufferToHex(publicKeyBuffer)

    // return the public key
    return {
      publicKey
    }
  }

  async balance() {
    this._loadWallet()

    let balance = (await this.web3.eth.getBalance(this.wallet[0].address)).toString()

    // return the wallet balance
    return {
      balance
    }
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

  _loadWallet() {
    // load the wallet from the keystore file
    // todo what if it does not exist?
    let keystoreBuffer = fs.readFileSync(`${this.keystorePath}/${this.walletId}`)
    let keystore = JSON.parse(keystoreBuffer)

    // decrypt it using the passcode
    this.wallet = this.web3.eth.accounts.wallet.decrypt([keystore], this.passcode);
  }
}

module.exports = WalletController;