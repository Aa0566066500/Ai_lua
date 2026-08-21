local Validator = {}

function Validator.IsString(value)
	return typeof(value) == "string"
end

function Validator.IsValidMessage(message, maxLength)
	if not Validator.IsString(message) then
		return false
	end

	if message == "" then
		return false
	end

	if #message > maxLength then
		return false
	end

	return true
end

function Validator.Trim(message)
	return message:match("^%s*(.-)%s*$")
end

return Validator