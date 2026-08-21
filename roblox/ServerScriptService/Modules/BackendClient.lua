local HttpService = game:GetService("HttpService")

local BackendClient = {}

local BACKEND_URL = "https://YOUR-BACKEND-DOMAIN.example/api/chat"

local function isValidUrl(url)
	return typeof(url) == "string"
		and url:match("^https://") ~= nil
end

function BackendClient.Send(message)
	if typeof(message) ~= "string" then
		return false, "Invalid message."
	end

	if not isValidUrl(BACKEND_URL) then
		return false, "Backend URL is not configured."
	end

	local body = HttpService:JSONEncode({
		message = message
	})

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = BACKEND_URL,
			Method = "POST",

			Headers = {
				["Content-Type"] = "application/json"
			},

			Body = body
		})
	end)

	if not success then
		return false, "Backend request failed."
	end

	if not response.Success then
		return false, "Backend returned an error."
	end

	local decodeSuccess, data = pcall(function()
		return HttpService:JSONDecode(response.Body)
	end)

	if not decodeSuccess then
		return false, "Invalid backend response."
	end

	if typeof(data) ~= "table" then
		return false, "Invalid backend data."
	end

	if data.ok ~= true then
		return false, data.error or "AI request failed."
	end

	return true, data.reply
end

return BackendClient