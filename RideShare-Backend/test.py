import torch
import torch.nn as nn


def init_weights(modules):
    pass
# Define BasicBlock
class BasicBlock(nn.Sequential):
    def __init__(
        self, in_channels, out_channels, kernel_size, stride=1, bias=False,
        bn=True, act=nn.ReLU(True)):

        m = [nn.Conv2d(
            in_channels, out_channels, kernel_size,
            padding=(kernel_size//2), stride=stride, bias=bias)
        ]
        if bn: m.append(nn.BatchNorm2d(out_channels))
        if act is not None: m.append(act)
        super(BasicBlock, self).__init__(*m)

# Define BasicBlockSig with Sigmoid activation
class BasicBlockSig(nn.Module):
    def __init__(self,
                 in_channels, out_channels,
                 ksize=3, stride=1, pad=1):
        super(BasicBlockSig, self).__init__()

        self.body = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, ksize, stride, pad),
            nn.Sigmoid()
        )

        init_weights(self.modules)
        
    def forward(self, x):
        out = self.body(x)
        return out

# Define CALayer using the above blocks
class CALayer(nn.Module):
    def __init__(self, channel, reduction=16):
        super(CALayer, self).__init__()

        self.avg_pool = nn.AdaptiveAvgPool2d(1)

        self.c1 = BasicBlock(channel , channel // reduction, 3, 1, 3, 3)
        self.c2 = BasicBlock(channel , channel // reduction, 3, 1, 5, 5)
        self.c3 = BasicBlock(channel , channel // reduction, 3, 1, 7, 7)
        self.c4 = BasicBlockSig((channel // reduction)*3, channel , 3, 1, 1)

    def forward(self, x):
        y = self.avg_pool(x)
        print(y.shape)
        c1 = self.c1(y)
        print(c1.shape)
        c2 = self.c2(y)
        print(c2.shape)
        c3 = self.c3(y)
        print(c3.shape)
        c_out = torch.cat([c1, c2, c3], dim=1)
        y = self.c4(c_out)
        return y * x

# Testing the CALayer
def test_CALayer():
    batch_size = 4
    channels = 64
    height, width = 32, 32  # Example spatial dimensions

    # Create random input tensor
    x = torch.randn(batch_size, channels, height, width)

    # Instantiate CALayer
    calayer = CALayer(channel=channels, reduction=16)

    # Forward pass
    output = calayer(x)

    # Print shapes
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {output.shape}")

    # Verify that output shape matches input shape
    assert output.shape == x.shape, "Output shape does not match input shape."
    print("CALayer test passed successfully.")

# Run the test
test_CALayer()
