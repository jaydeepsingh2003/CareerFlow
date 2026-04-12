n = int(input())
arr = list(map(int, input().split()))

freq = {}

for num in arr:
    if num in freq:
        freq[num] += 1
    else:
        freq[num] = 1

for key in freq:
    if freq[key] == 1:
        print(key)