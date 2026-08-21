local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(
	ReplicatedStorage:WaitForChild("AIConfig")
)

local AIClient = {}

function AIClient.Send(message)
	if typeof(message) ~= "string" then
		return false
	end

	if #message < 1 then
		return false
	end

	if #message > Config.MaxMessageLength then
		return false
	end

	local remote = ReplicatedStorage:WaitForChild(
		Config.RemoteName
	)

	remote:FireServer(message)

	return true
end

function AIClient.GetRemote()
	return ReplicatedStorage:WaitForChild(
		Config.RemoteName
	)
end

return AIClient