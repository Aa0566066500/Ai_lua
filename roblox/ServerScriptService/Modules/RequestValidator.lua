local RequestValidator = {}

local MAX_MESSAGE_LENGTH = 2000

function RequestValidator.IsValidPlayer(player)
	return player ~= nil
		and player:IsA("Player")
end

function RequestValidator.IsValidMessage(message)
	if typeof(message) ~= "string" then
		return false
	end

	if #message < 1 then
		return false
	end

	if #message > MAX_MESSAGE_LENGTH then
		return false
	end

	return true
end

function RequestValidator.SanitizeMessage(message)
	if typeof(message) ~= "string" then
		return nil
	end

	message = message:gsub("%z", "")

	message = message:match("^%s*(.-)%s*$")

	if #message < 1 then
		return nil
	end

	if #message > MAX_MESSAGE_LENGTH then
		return nil
	end

	return message
end

return RequestValidator