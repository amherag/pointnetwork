class PointController {
    constructor(ctx) {
      this.ctx = ctx;
    }

    _response(payload) {
      return {
        status: 200,
        data: payload
      }
    }
  }

  module.exports = PointController;