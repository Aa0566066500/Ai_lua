local HttpService = game:GetService("HttpService")

local Serializer = {}

function Serializer.Encode(data)
	local success, result = pcall(function()
		return HttpService:JSONEncode(data)
	end)

	if not success then
		return nil
	end

	return result
end

function Serializer.Decode(json)
	if typeof(json) ~= "string" then
		return nil
	end

	local success, result = pcall(function()
		return HttpService:JSONDecode(json)
	end)

	if not success then
		return nil
	end

	return result
end

return Serializer