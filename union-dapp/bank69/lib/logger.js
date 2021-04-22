class Logger{
  static log(...params){
    const time = new Date().toTimeString().substr(0,8)
    const s = `[INFO][${time}]` + params.join(' ') 
    console.log(s)
  }

  static error(...params){
    const time = new Date().toTimeString().substr(0,8)
    const s = `[ERROR][${time}]` + params.join(' ')
    console.log(s)
  }
}

module.exports = Logger