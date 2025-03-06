import app from './app.js'


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


//Rutas
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  