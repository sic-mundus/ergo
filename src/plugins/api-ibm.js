import axios from 'axios'

export default axios.create({
  baseURL: 'https://api.eu-de.language-translator.watson.cloud.ibm.com',
  headers: {
    //'Content-Type': 'application/json',
    //'Authorization': 'apiKey:IrKcr7_-Ex8yfWAIWW9WDiwE5j8DLPtcQJB5YXaL9c2W'
  }
})