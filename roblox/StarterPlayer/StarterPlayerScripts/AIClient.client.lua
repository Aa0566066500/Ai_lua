local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(
	ReplicatedStorage:WaitForChild("AIConfig")
)

local remote = ReplicatedStorage:WaitForChild(
	Config.RemoteName
)

local function sendMessage(message)
	if typeof(message) ~= "string" then
		return
	end

	if #message < 1 then
		return
	end

	if #message > Config.MaxMessageLength then
		warn("Message is too long.")
		return
	end

	remote:FireServer(message)
end

remote.OnClientEvent:Connect(function(data)

	if typeof(data) ~= "table" then
		return
	end

	if data.Type == "Response" then

		print("[AI]", data.Message)

	elseif data.Type == "Error" then

		warn("[AI Error]", data.Message)

	end
end)

-- اختبار فقط:
-- sendMessage("اشرح لي RemoteEvent في Roblox")