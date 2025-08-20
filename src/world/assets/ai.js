const block = app.get('Block')
app.on('update', delta => {
  block.rotation.y -= 1 * delta
})
