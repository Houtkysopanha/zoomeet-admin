// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const response = await $fetch('https://your-api.com/login', {
    method: 'POST',
    body,
  })

  // You can customize the response, log, or filter data
  return response
})
